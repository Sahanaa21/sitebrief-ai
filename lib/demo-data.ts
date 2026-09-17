import type { AnalysisResult, Communication, Project } from "@/types";

// Demo Mode is mandatory and must work with zero Gemini API key. This is
// hand-authored sample data, clearly presented in the UI as "Demo data" —
// never as a live Gemini result. It exists to demonstrate the full
// SiteBrief AI workflow end-to-end during the hackathon demo.

export const DEMO_PROJECT_ID = "proj_demo_riverside";
export const DEMO_COMMUNICATION_ID = "comm_demo_riverside_01";

export const DEMO_PROJECT: Project = {
  id: DEMO_PROJECT_ID,
  name: "Riverside Residence",
  description:
    "A 3-bedroom residential project on the riverside plot — currently in the interior finishing stage.",
  createdAt: "2026-08-18T09:00:00.000Z",
  isDemo: true,
};

export const DEMO_COMMUNICATION_TEXT = `[Aug 18, 9:02 AM] Priya (Architect): Morning team — sharing the updated kitchen layout drawing (Rev C). The island has moved 300mm toward the window per the client's request last week.

[Aug 18, 9:10 AM] Karan (Client): Rev C looks good. Approved, please proceed with this layout for the kitchen.

[Aug 18, 9:14 AM] Priya (Architect): Great, thanks Karan. Rahul, please update the working drawing set to reflect Rev C by this Friday.

[Aug 18, 9:16 AM] Rahul (Site Engineer): Noted, will update the kitchen drawing and circulate by Friday.

[Aug 18, 11:40 AM] Priya (Architect): For the master bathroom, we had shortlisted tile 312 (dark grey matte). Checking supplier stock now.

[Aug 18, 2:05 PM] Suresh (Supplier - Modern Tiles): Unfortunately tile 312 is out of stock and the next batch is 6 weeks out. We do have tile 315 in the same finish family, slightly lighter grey, available immediately.

[Aug 18, 2:20 PM] Priya (Architect): Given the timeline, I'd suggest we switch to tile 315 instead of waiting 6 weeks for 312. Karan, if shade 315 is available, that's fine for us — could you confirm on your end?

[Aug 18, 3:45 PM] Karan (Client): Okay, let's go with 315 then since 312 isn't available in time. Please proceed.

[Aug 18, 3:50 PM] Priya (Architect): Confirmed — updating the material schedule to tile 315 for the master bathroom. Ashok, please get contractor confirmation on installation timeline once the tiles arrive.

[Aug 18, 4:10 PM] Ashok (Contractor): Will confirm the installation slot once tile 315 is delivered to site. Still waiting on delivery date from Suresh.

[Aug 19, 10:00 AM] Priya (Architect): Separate issue — the false ceiling contractor flagged that the living room AC duct routing clashes with the beam at grid line C3. We need a structural sign-off before proceeding with that section.

[Aug 19, 10:05 AM] Rahul (Site Engineer): I'll raise this with the structural consultant, but we don't have a resolution yet. Flagging as open for now.

[Aug 19, 11:30 AM] Priya (Architect): Also, façade paint samples are pending client review — Karan, could you take a look and confirm your preferred shade by next Wednesday? This is holding up the exterior painting schedule.

[Aug 19, 11:32 AM] Karan (Client): Will check the samples and get back by Wednesday.

[Aug 19, 3:00 PM] Priya (Architect): Last item — we discussed extending the deck by 2 feet earlier this week but haven't heard back from Karan on cost approval, so that one's still pending. Not proceeding until confirmed.`;

export const DEMO_ANALYSIS: AnalysisResult = {
  summary:
    "The team finalized the kitchen layout (Rev C) with client approval, and Rahul is updating the working drawings by Friday. The master bathroom tile selection changed from tile 312 to tile 315 due to a 6-week supplier delay, and the client approved the switch; contractor installation timing is still pending delivery. A structural clash between the AC duct and a beam at grid line C3 was flagged as an open issue awaiting consultant sign-off. Façade paint colour approval and a proposed 2-foot deck extension are both still pending client decisions.",
  decisions: [
    {
      id: "demo_dec_1",
      title: "Kitchen layout Rev C",
      description:
        "Client approved the updated kitchen layout drawing (Rev C) with the island moved 300mm toward the window.",
      status: "approved",
      people: ["Priya", "Karan"],
      sourceReference: "Rev C looks good. Approved, please proceed with this layout for the kitchen.",
    },
    {
      id: "demo_dec_2",
      title: "Master bathroom tile: switch from 312 to 315",
      description:
        "Tile 312 was originally shortlisted but is out of stock for 6 weeks. The team switched to tile 315, and the client approved the change.",
      status: "changed",
      people: ["Priya", "Karan", "Suresh"],
      sourceReference: "Okay, let's go with 315 then since 312 isn't available in time. Please proceed.",
    },
    {
      id: "demo_dec_3",
      title: "Deck extension (2 feet)",
      description:
        "A proposed 2-foot deck extension is awaiting client cost approval and has not been confirmed.",
      status: "pending",
      people: ["Karan"],
      sourceReference:
        "we discussed extending the deck by 2 feet earlier this week but haven't heard back from Karan on cost approval",
    },
  ],
  actionItems: [
    {
      id: "demo_act_1",
      task: "Update kitchen working drawing to Rev C",
      assignee: "Rahul",
      deadline: "Friday",
      priority: "high",
      status: "pending",
      sourceReference: "please update the working drawing set to reflect Rev C by this Friday",
    },
    {
      id: "demo_act_2",
      task: "Get contractor confirmation on tile 315 installation timeline",
      assignee: "Ashok",
      deadline: null,
      priority: "medium",
      status: "pending",
      sourceReference: "Ashok, please get contractor confirmation on installation timeline once the tiles arrive.",
    },
    {
      id: "demo_act_3",
      task: "Raise AC duct / beam clash with structural consultant",
      assignee: "Rahul",
      deadline: null,
      priority: "high",
      status: "pending",
      sourceReference: "I'll raise this with the structural consultant, but we don't have a resolution yet.",
    },
    {
      id: "demo_act_4",
      task: "Review façade paint samples and confirm preferred shade",
      assignee: "Karan",
      deadline: "next Wednesday",
      priority: "medium",
      status: "pending",
      sourceReference: "could you take a look and confirm your preferred shade by next Wednesday?",
    },
  ],
  issues: [
    {
      id: "demo_iss_1",
      title: "AC duct clashes with beam at grid line C3",
      description:
        "The false ceiling contractor flagged a routing clash between the living room AC duct and the beam at grid line C3. Requires structural sign-off before proceeding.",
      status: "open",
      sourceReference:
        "the false ceiling contractor flagged that the living room AC duct routing clashes with the beam at grid line C3",
    },
    {
      id: "demo_iss_2",
      title: "Tile 315 delivery date unconfirmed",
      description:
        "Contractor is waiting on a delivery date for tile 315 before confirming the installation slot.",
      status: "open",
      sourceReference: "Still waiting on delivery date from Suresh.",
    },
  ],
  changes: [
    {
      id: "demo_chg_1",
      item: "Master bathroom tile",
      previousValue: "Tile 312 (dark grey matte)",
      newValue: "Tile 315 (lighter grey, same finish family)",
      reason: "Tile 312 was out of stock with a 6-week lead time; 315 was available immediately.",
      sourceReference: "Unfortunately tile 312 is out of stock and the next batch is 6 weeks out.",
    },
  ],
  people: [
    { name: "Priya", role: "Architect", sourceReference: "Priya (Architect): Morning team" },
    { name: "Karan", role: "Client", sourceReference: "Karan (Client): Rev C looks good." },
    { name: "Rahul", role: "Site Engineer", sourceReference: "Rahul (Site Engineer): Noted" },
    { name: "Suresh", role: "Supplier - Modern Tiles", sourceReference: "Suresh (Supplier - Modern Tiles)" },
    { name: "Ashok", role: "Contractor", sourceReference: "Ashok (Contractor): Will confirm" },
  ],
  deadlines: [
    {
      description: "Update kitchen working drawing to Rev C",
      date: "Friday",
      relatedTo: "Kitchen drawing",
      sourceReference: "please update the working drawing set to reflect Rev C by this Friday",
    },
    {
      description: "Confirm preferred façade paint shade",
      date: "next Wednesday",
      relatedTo: "Façade paint",
      sourceReference: "could you take a look and confirm your preferred shade by next Wednesday?",
    },
  ],
};

export const DEMO_COMMUNICATION: Communication = {
  id: DEMO_COMMUNICATION_ID,
  projectId: DEMO_PROJECT_ID,
  source: "demo",
  fileName: null,
  rawText: DEMO_COMMUNICATION_TEXT,
  createdAt: "2026-08-19T15:30:00.000Z",
  analysis: DEMO_ANALYSIS,
  isDemo: true,
};
