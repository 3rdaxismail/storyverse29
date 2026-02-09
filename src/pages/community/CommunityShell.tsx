
import RoomPanel from "./RoomPanel";
import ChatPanel from "./ChatPanel";
import styles from "./CommunityPage.module.css";

const CommunityShell = () => {
  return (
    <div className={styles.communityShell}>
      <RoomPanel />
      <ChatPanel />
    </div>
  );
};

export default CommunityShell;
