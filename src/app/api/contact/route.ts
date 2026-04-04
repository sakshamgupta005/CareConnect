import { validateContactSubmissionBody } from "../../../lib/contactSubmission";
import { assertPrismaDelegates, prisma } from "../../../lib/prisma";

export async function GET(): Promise<Response> {
  try {
    assertPrismaDelegates(["contactSubmission"]);

    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        createdAt: true,
      },
    });

    return Response.json(
      submissions.map((submission) => ({
        ...submission,
        createdAt: submission.createdAt.toISOString(),
      })),
      { status: 200 },
    );
  } catch (error) {
    console.error("[api/contact] Failed to load contact submissions:", error);
    const message = error instanceof Error ? error.message : "Could not load contact submissions.";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    assertPrismaDelegates(["contactSubmission"]);

    const body = (await request.json()) as unknown;
    const payload = validateContactSubmissionBody(body);

    const submission = await prisma.contactSubmission.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone || null,
        message: payload.message,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return Response.json(
      {
        id: submission.id,
        createdAt: submission.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/contact] Failed to save contact submission:", error);
    const message = error instanceof Error ? error.message : "Could not save contact submission.";
    return Response.json({ error: message }, { status: 400 });
  }
}
