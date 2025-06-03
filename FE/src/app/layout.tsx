import type { Metadata } from "next";
import "../../public/assets/scss/globals.scss";
import "../../public/assets/scss/style.scss";
import { Providers } from "@/redux-toolkit/provider";
import { ToastContainer } from "react-toastify";
import { getServerSession } from "next-auth";
import { authoption } from "./api/auth/[...nextauth]/authOption";
import SessionWrapper from "@/Common/SessionWrapper";
import ErrorBoundary from "@/Common/ErrorBoundry";
import PostModalWrapper from "@/components/Post/PostModalWrapper"; 

export const metadata: Metadata = {
  title: "Sep21Connect",
  description: "Website chính thức của Sep21Connect",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authoption);
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="text/javascript"
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJgF2Igh6xR6dQ572BBhq0B0"
        ></script>
      </head>
      <body>
        <ErrorBoundary>
          <SessionWrapper session={session}>
            <Providers>
              {children}
              <PostModalWrapper />
            </Providers>
            <ToastContainer />
          </SessionWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
