import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

async function Home() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  // Get user data to check language and userType
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user?.language || !user?.userType) {
    redirect("/settings");
  }

  // Redirect based on user type
  if (user.userType === "student") {
    redirect("/student/view");
  } else if (user.userType === "tutor") {
    redirect("/tutor/view");
  }

  // Fallback redirect if userType is somehow invalid
  redirect("/settings");
}

export default Home;
