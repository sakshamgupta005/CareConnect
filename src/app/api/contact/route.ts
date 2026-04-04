import { validateContactSubmissionBody } from "../../../lib/contactSubmission";
import { assertPrismaDelegates, prisma } from "../../../lib/prisma";

export async function GET(request: Request): Promise<Response> {
  try {
    assertPrismaDelegates(["contactSubmission"]);

    const role = request.headers.get("x-careconnect-role")?.trim().toLowerCase() || "";
    if (role !== "doctor") {
      return Response.json({ error: "Only doctor role can view contact submissions." }, { status: 403 });
    }

    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        age: true,
        gender: true,
        bloodGroup: true,
        reportTitle: true,
        reportFileName: true,
        reportFileType: true,
        reportFilePath: true,
        reportRawText: true,
        linkedReportId: true,
        linkedReportStatus: true,
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

export async function DELETE(request: Request): Promise<Response> {
  try {
    assertPrismaDelegates(["contactSubmission"]);

    const role = request.headers.get("x-careconnect-role")?.trim().toLowerCase() || "";
    if (role !== "doctor") {
      return Response.json({ error: "Only doctor role can remove contact submissions." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get("id")?.trim() || "";
    if (!submissionId) {
      return Response.json({ error: "Missing submission id." }, { status: 400 });
    }

    await prisma.contactSubmission.delete({
      where: { id: submissionId },
    });

    return Response.json({ deleted: true }, { status: 200 });
  } catch (error) {
    console.error("[api/contact] Failed to delete contact submission:", error);
    const message = error instanceof Error ? error.message : "Could not delete contact submission.";
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
        role: payload.role || null,
        age: payload.age || null,
        gender: payload.gender || null,
        bloodGroup: payload.bloodGroup || null,
        reportTitle: payload.reportTitle || null,
        reportFileName: payload.reportFileName || null,
        reportFileType: payload.reportFileType || null,
        reportFilePath: payload.reportFilePath || null,
        reportRawText: payload.reportRawText || null,
        linkedReportId: payload.linkedReportId || null,
        linkedReportStatus: payload.linkedReportStatus || null,
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
