import Image from "next/image";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import Link from "next/link";

// TODO: Rebuild course management against the new schema.
// The previous implementation (courses + sections + videos with plain
// title/description) was removed because the DB moved to the new model:
//   courses → modules → module_items (video/pdf/test/text/link) → course_tests → exercises
// with display text stored as i18n keys (title_key / description_key / *_key),
// snake_case columns, and per-user progress. See the main app's
// docs/courses-schema-reference.md for the target shape. Until it's rebuilt,
// this page shows a placeholder.
export default function CourseManagementPage() {
  return (
    <div className="flex flex-col p-6 min-h-[calc(100vh-var(--header-height))]">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Side - Visual */}
          <div className="w-full">
            <div className="bg-white p-6 dark:bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-500 via-purple-400 to-blue-500 rounded-3xl">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
                  alt="Modern workspace with laptop and learning materials"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-purple-900/30 to-transparent"/>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 via-blue-500/30 to-transparent"/>
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-white text-gray-900 border-0 shadow-sm font-medium px-3 py-1">
                    Being rebuilt
                  </Badge>
                </div>
              </div>
              <div className="h-20 w-full bg-background"/>
            </div>
          </div>

          {/* Right Side - Status */}
          <div className="w-full flex flex-col justify-center space-y-6 lg:pt-16">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Course management is being rebuilt
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                The courses data model changed (modules, content items, tests and
                i18n keys). The management UI is being rebuilt against the new
                schema and is temporarily unavailable.
              </p>
            </div>
            <div>
              <Button size="lg" asChild>
                <Link href={"/dashboard"}>Got it</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
