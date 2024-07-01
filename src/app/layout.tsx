import Navbar from "../components/navbar";
import Providers from "../components/providers";
import "../styles/global.css";
import Footer from "../components/footer";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html lang="en">
        <body className={`flex flex-col min-h-screen`}>
          <Providers>
            <Navbar />
            {children}
            <div className="grow" />
            <Footer />
          </Providers>
        </body>
      </html>
    </>
  );
}
