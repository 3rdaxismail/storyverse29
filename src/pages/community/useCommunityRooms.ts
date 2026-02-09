import { useState, useCallback, useEffect } from "react";
import { 
  collection, 
  doc, 
  getDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  Timestamp,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { db, auth } from "../../firebase/config";

const ROOMS = [
  { id: "story-writing", name: "Story Writing" },
  { id: "screen-film", name: "Screen & Film" },
  { id: "novel-longform", name: "Novel & Long-form" },
  { id: "documentary-nonfiction", name: "Documentary & Non-fiction" },
  { id: "poems-lyrics", name: "Poems & Lyrics" },
  { id: "writing-help", name: "Writing Help" },
];

interface Message {
  id: string;
  senderUid: string;
  content: string;
  timestamp: number;
  displayName?: string;
  photoURL?: string;
  username?: string;
  edited?: boolean;
  editedAt?: number;
}

interface UserProfile {
  displayName: string;
  photoURL?: string;
  username?: string;
}

export function useCommunityRooms(currentRoomId?: string) {
  const [rooms, setRooms] = useState(() =>
    ROOMS.map((room) => ({ ...room, messages: [] as Message[] }))
  );
  const activeRoomId = currentRoomId || ROOMS[0].id;

  // Load messages from Firestore for active room
  useEffect(() => {
    if (!activeRoomId || !auth.currentUser) return;

    const messagesRef = collection(db, `communityRooms/${activeRoomId}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messages: Message[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const senderUid = data.senderUid;

        // Resolve user profile from users/{uid}
        let displayName = "Unknown User";
        let photoURL: string | undefined = undefined;
        let username: string | undefined = undefined;

        if (senderUid) {
          const userDocRef = doc(db, "users", senderUid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserProfile;
            displayName = userData.displayName || "Unknown User";
            photoURL = userData.photoURL;
            username = userData.username;
          }
        }

        messages.push({
          id: docSnap.id,
          senderUid,
          content: data.content,
          timestamp: data.timestamp instanceof Timestamp 
            ? data.timestamp.toMillis() 
            : Date.now(),
          displayName,
          photoURL,
          username,
          edited: data.edited || false,
          editedAt: data.editedAt instanceof Timestamp 
            ? data.editedAt.toMillis() 
            : undefined,
        });
      }

      setRooms((prev) =>
        prev.map((room) =>
          room.id !== activeRoomId ? room : { ...room, messages }
        )
      );
    });

    return () => unsubscribe();
  }, [activeRoomId]);

  // Send message to Firestore
  const sendMessage = useCallback(async (roomId: string, content: string) => {
    if (!auth.currentUser) return;

    // Fetch user's display name from Firestore
    let displayName = 'Anonymous';
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        displayName = userDoc.data().displayName || 'Anonymous';
      }
    } catch (error) {
      console.error('[useCommunityRooms] Error fetching user profile:', error);
    }

    const messagesRef = collection(db, `communityRooms/${roomId}/messages`);
    await addDoc(messagesRef, {
      senderUid: auth.currentUser.uid,
      displayName: displayName,
      content,
      timestamp: serverTimestamp(),
    });
  }, []);

  // Delete message from Firestore
  const deleteMessage = useCallback(async (roomId: string, messageId: string) => {
    if (!auth.currentUser) return;

    try {
      const messageRef = doc(db, `communityRooms/${roomId}/messages`, messageId);
      await deleteDoc(messageRef);
    } catch (error) {
      console.error('[useCommunityRooms] Error deleting message:', error);
      throw error;
    }
  }, []);

  // Edit message in Firestore
  const editMessage = useCallback(async (roomId: string, messageId: string, newContent: string) => {
    if (!auth.currentUser) return;

    try {
      const messageRef = doc(db, `communityRooms/${roomId}/messages`, messageId);
      await updateDoc(messageRef, {
        content: newContent,
        edited: true,
        editedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('[useCommunityRooms] Error editing message:', error);
      throw error;
    }
  }, []);

  const currentUser = auth.currentUser
    ? {
        id: auth.currentUser.uid,
        username: auth.currentUser.displayName || "Anonymous Writer",
        avatarUrl: auth.currentUser.photoURL || undefined,
      }
    : null;

  return {
    rooms,
    activeRoomId,
    sendMessage,
    deleteMessage,
    editMessage,
    USER: currentUser,
  };
}
