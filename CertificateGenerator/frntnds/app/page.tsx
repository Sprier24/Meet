import GenerateCertificate from "./generate/page";
import ServiceCertificate from "./service/page";

export default function Home() {
  return (
    <>
      <GenerateCertificate />
      <ServiceCertificate />
    </>
  );
}
