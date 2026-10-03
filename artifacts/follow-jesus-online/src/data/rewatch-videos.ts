import publishedTranscripts from "./rewatch-transcripts.json";

export type TranscriptBlock = {
  kind: "paragraph" | "heading" | "list";
  text: string;
};

export type VideoTranscript = {
  sourceUrl: string;
  blocks: TranscriptBlock[];
};

export type RewatchVideo = {
  id: string;
  title: string;
  transcript?: VideoTranscript;
};

const transcripts = publishedTranscripts as Record<string, VideoTranscript>;

/** Keep the requested sequence; related study articles are not transcripts. */
export const REWATCH_VIDEOS: RewatchVideo[] = [
  { id: "SEg4a2xaJyw", title: "Jesus’ Resurrection and You" },
  { id: "XB7wGTnYeaE", title: "The Gift of Heaven" },
  { id: "psw_5rn9WFY", title: "God’s Vision" },
  { id: "56GWpb0F2qU", title: "Personal Transformation" },
  { id: "Wq2g9GTgc_Q", title: "Eternal Impact" },
].map((video) => ({ ...video, transcript: transcripts[video.id] }));