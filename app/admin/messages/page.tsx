import AdminHeader from "@/components/AdminHeader";
import AdminMessagesClient from "@/components/AdminMessagesClient";
import { connectMongoose } from "@/lib/mongoose";
import { Contact } from "@/models/Contact";

export default async function AdminMessagesPage() {
  await connectMongoose();
  const contacts = await Contact.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <AdminHeader label="Messages" />
      </header>

      <AdminMessagesClient initialMessages={JSON.parse(JSON.stringify(contacts))} />
    </div>
  );
}
