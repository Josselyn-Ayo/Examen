import { Message } from "@features/chat/domain/entities/Message";
import { Room } from "@features/chat/domain/entities/Room";
import { IChatRepository, SendMessageInput } from "@features/chat/domain/repositories/IChatRepository";
import { supabase } from "@shared/infrastructure/supabase/client";
const FileSystem: any = require('expo-file-system/legacy');
export class SupabaseChatRepository implements IChatRepository {
  private readonly imagesBucket = "Imagenes";

  async getRooms(userId: string, _role: string): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms').select(`
        id, name, created_by, created_at,
        pet_id, adoptante_id, refugio_id
      `)
      .or(`adoptante_id.eq.${userId},refugio_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const rooms = (data ?? []).map(this.mapRoom);

    const enriched = await Promise.all(
      rooms.map(async (room) => {
        let petName: string | undefined;
        if (room.petId) {
          const { data: pet } = await supabase
            .from('pets').select('name').eq('id', room.petId).maybeSingle();
          petName = pet?.name ?? undefined;
        }
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('room_id', room.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        return {
          ...room,
          petName,
          lastMessage: lastMsg?.content ?? undefined,
          lastMessageAt: lastMsg?.created_at ? new Date(lastMsg.created_at) : undefined,
        };
      }),
    );

    enriched.sort((a, b) => {
      const aTime = a.lastMessageAt?.getTime() ?? a.createdAt.getTime();
      const bTime = b.lastMessageAt?.getTime() ?? b.createdAt.getTime();
      return bTime - aTime;
    });

    return enriched;
  }

  async createRoom(name: string, createdBy: string, petId?: string, adoptanteId?: string, refugioId?: string): Promise<Room> {
    const payload: Record<string, any> = { name, created_by: createdBy };
    if (petId) payload.pet_id = petId;
    if (adoptanteId) payload.adoptante_id = adoptanteId;
    if (refugioId) payload.refugio_id = refugioId;

    const { data, error } = await supabase
      .from('rooms').insert(payload)
      .select().single();
    if (error) throw error;
    return this.mapRoom(data);
  }

  async getMessages(roomId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('id, room_id, user_id, content, image_url, created_at')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50);
    if (error) throw error;
    const msgs = (data ?? []) as any[];
    const userIds = Array.from(new Set(msgs.map((m) => m.user_id)));
    let profilesMap: Record<string, string | undefined> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);
      profilesMap = (profiles ?? []).reduce((acc: any, p: any) => {
        acc[p.id] = p.username;
        return acc;
      }, {} as Record<string, string>);
    }
    const mapped = msgs.map((raw) => {
      const username = profilesMap[raw.user_id];
      return this.mapMessage({ ...raw, profiles: { username } });
    });
    return mapped;
  }

  async sendMessage(roomId: string, userId: string, input: SendMessageInput): Promise<Message> {
    const imageUrl = input.imageUri ? await this.uploadImage(roomId, userId, input.imageUri) : null;
    const { data, error } = await supabase
      .from('messages')
      .insert({ room_id: roomId, user_id: userId, content: input.content ?? "", image_url: imageUrl })
      .select('id, room_id, user_id, content, image_url, created_at')
      .single();
    if (error) throw error;
    const msg = data as any;
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();
    return this.mapMessage({ ...msg, profiles: { username: profile?.username } });
  }

  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
          event: 'INSERT', schema: 'public',
          table: 'messages', filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles').select('username')
            .eq('id', payload.new.user_id).single();
          onMessage({
            id:             payload.new.id,
            roomId:         payload.new.room_id,
            userId:         payload.new.user_id,
            content:        payload.new.content,
            imageUrl:       payload.new.image_url,
            createdAt:      new Date(payload.new.created_at),
            authorUsername: profile?.username,
          });
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }

  private mapRoom = (raw: any): Room => ({
    id: raw.id, name: raw.name,
    createdBy: raw.created_by, createdAt: new Date(raw.created_at),
    petId: raw.pet_id ?? undefined,
    adoptanteId: raw.adoptante_id ?? undefined,
    refugioId: raw.refugio_id ?? undefined,
  });

  private mapMessage = (raw: any): Message => ({
    id: raw.id, roomId: raw.room_id, userId: raw.user_id,
    content: raw.content, imageUrl: raw.image_url ?? raw.imageUrl ?? null, createdAt: new Date(raw.created_at),
    authorUsername: raw.profiles?.username,
  });

  private async uploadImage(roomId: string, userId: string, imageUri: string): Promise<string> {
    const extension = this.getFileExtension(imageUri);
    const filePath = `${roomId}/${userId}/${Date.now()}.${extension}`;
    const contentType = `image/${extension}`;

    try {
      const sessionRes: any = await supabase.auth.getSession?.();
      const session = sessionRes?.data?.session ?? sessionRes?.session ?? null;
      const token = session?.access_token ?? null;
      if (!token) throw new Error('No session token available for upload');

      const uploadUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/${this.imagesBucket}/${filePath}`;

      const result = await FileSystem.uploadAsync(uploadUrl, imageUri, {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': contentType,
        },
      });

      if (result.status >= 200 && result.status < 300) {
        const publicUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${this.imagesBucket}/${filePath}`;
        return publicUrl;
      }

      throw new Error(`Upload failed: ${result.status} ${result.body}`);
    } catch (nativeErr) {
      console.warn('[SupabaseChatRepository] native upload failed, trying base64 fallback', nativeErr);
    }

    try {
      const sessionRes: any = await supabase.auth.getSession?.();
      const session = sessionRes?.data?.session ?? sessionRes?.session ?? null;
      const token = session?.access_token ?? null;
      if (!token) throw new Error('No session token available');

      const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const uploadUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/${this.imagesBucket}/${filePath}`;
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': contentType,
        },
        body: bytes,
      });

      if (putRes.ok) {
        const publicUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${this.imagesBucket}/${filePath}`;
        return publicUrl;
      }

      const putText = await putRes.text().catch(() => '<no body>');
      throw new Error(`Upload failed: ${putRes.status} ${putRes.statusText} ${putText}`);
    } catch (fallbackErr) {
      console.error('[SupabaseChatRepository] all upload methods failed', fallbackErr);
      throw new Error('Failed to upload image: ' + ((fallbackErr as any)?.message ?? String(fallbackErr)));
    }
  }

  private getFileExtension(imageUri: string): string {
    const cleaned = imageUri.split('?')[0];
    const match = cleaned.match(/\.([a-zA-Z0-9]+)$/);
    return match?.[1]?.toLowerCase() ?? 'jpg';
  }
}
