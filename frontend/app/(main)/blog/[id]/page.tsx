
import Image from "next/image";
import { Bookmark, Heart, MessageSquare, Share2 } from "lucide-react";
import Header from "../../_components/_common/Header";
import BlogHero from "../../_components/_blog/BlogHero";
import Container from "../../_components/_common/Cointainer";

export default function BlogDetailPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FC] pb-24">
      <Header />

      <Container className="max-w-5xl py-8 md:py-12">
        <BlogHero />

        <div className="mt-10 flex items-center gap-4 border-b border-gray-200 pb-8">
          <div className="relative h-14 w-14 overflow-hidden rounded-full">
            <Image
              src="/images/tải xuống.webp"
              alt="author"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Sarah Jenkins
            </h3>

            <p className="text-gray-500">Senior Culinary Explorer</p>
          </div>
        </div>

        <div className="prose prose-lg mt-10 max-w-none text-gray-700">
          <p>
            There’s something uniquely invigorating about the salt-tinged air
            and the rhythmic sound of waves crashing against weathered pilings.
          </p>

          <p>
            As the sun begins its descent, the light turns a liquid gold,
            transforming the simple acts of peeling a shrimp or cracking a crab
            claw into a cinematic experience.
          </p>
        </div>

        <div className="mt-12 flex items-center justify-between border-y border-gray-200 py-6">
          <div className="flex items-center gap-8 text-gray-700">
            <div className="flex items-center gap-2">
              <Heart size={20} />
              <span>1.2k</span>
            </div>

            <div className="flex items-center gap-2">
              <MessageSquare size={20} />
              <span>48</span>
            </div>
          </div> 
        </div>
      </Container>
    </main>
  );
}