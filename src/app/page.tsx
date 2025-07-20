import Login from "./auth/login/page";

export const metadata = {
  title: "POS System",
  description: "Developed By Tineth Pathirage",
  icons: {
    icon: "/jit/images/icon.png",
  },
};

export default function Page() {
  return <Login />;
}
