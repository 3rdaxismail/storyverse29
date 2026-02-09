import React from "react";
import { useParams } from "react-router-dom";
import CommunityPage from "./community/CommunityPage";

const CommunityPageWrapper: React.FC = () => {
  // This wrapper is for lazy loading if needed in App.tsx
  const { roomId } = useParams();
  return <CommunityPage key={roomId || "default"} />;
};

export default CommunityPageWrapper;
