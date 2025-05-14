import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { UploadApiResponse } from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  try {
    const result = await cloudinary.v2.search
      .expression("folder:kurz AND resource_type:video")
      .sort_by("created_at", "desc")
      .max_results(30)
      .execute();

    const videos = result.resources.map((video: any) => ({
      id: video.public_id,
      title: video.public_id.split("/").pop() || video.public_id,
      videoUrl: video.secure_url,
      thumbnailUrl: cloudinary.v2.url(video.public_id, {
        resource_type: "video",
        format: "jpg",
        transformation: [{ width: 300, height: 200, crop: "fill" }],
      }),
      date: new Date(video.created_at).toLocaleString(),
      summary: video.context?.custom?.summary || "",
    }));

    return NextResponse.json({ success: true, videos }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("video") as File;

  if (!file) {
    return NextResponse.json(
      { success: false, error: "No video file provided" },
      { status: 400 }
    );
  }

  try {
    // Generate unique file hash to prevent duplicates
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = await createFileHash(buffer);

    const existingVideos = await cloudinary.v2.search
      .expression(`folder:kurz AND resource_type:video AND filename:${hash}`)
      .execute();

    if (existingVideos.resources.length > 0) {
      const existingVideo = existingVideos.resources[0];
      return NextResponse.json(
        {
          success: true,
          videoUrl: existingVideo.secure_url,
          publicId: existingVideo.public_id,
          isExisting: true,
        },
        { status: 200 }
      );
    }

    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.v2.uploader
          .upload_stream(
            {
              resource_type: "video",
              folder: "kurz",
              public_id: hash,
              filename_override: hash,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result!);
            }
          )
          .end(buffer);
      }
    );

    return NextResponse.json(
      {
        success: true,
        videoUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        isExisting: false,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Video upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Video upload failed",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  let publicId = searchParams.get("id");

  if (!publicId) {
    return NextResponse.json({ error: "Missing public ID" }, { status: 400 });
  }

  try {
    publicId = decodeURIComponent(publicId);
    publicId = publicId.replace(/^v\d+\//, "");

    const result = await cloudinary.v2.uploader.destroy(publicId, {
      resource_type: "video",
      invalidate: true,
      type: "upload",
    });

    console.log("Cloudinary deletion result:", result);

    if (result.result !== "ok") {
      return NextResponse.json(
        {
          error: "Failed to delete from Cloudinary",
          details: result,
          publicIdUsed: publicId,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, publicId }, { status: 200 });
  } catch (error: any) {
    console.error("Cloudinary deletion error:", error);
    return NextResponse.json(
      {
        error: error.message,
        publicIdAttempted: publicId,
      },
      { status: 500 }
    );
  }
}

// Helper function to generate file hash
async function createFileHash(buffer: Buffer): Promise<string> {
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
