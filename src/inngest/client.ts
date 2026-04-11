import { Inngest } from "inngest";

export type Events = {
  "xentara/publication.detected": {
    name: "xentara/publication.detected";
    data: { publicationId: string; sourceUrl: string; hubId: string };
  };
  "xentara/source.added": {
    name: "xentara/source.added";
    data: { sourceId: string; url: string; type: string };
  };
  "xentara/source.cron.discovery": {
    name: "xentara/source.cron.discovery";
    data: {};
  };
  "xentara/publication.published": {
    name: "xentara/publication.published";
    data: { publicationId: string; hubId: string };
  };
};

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "xentara-core"
});
