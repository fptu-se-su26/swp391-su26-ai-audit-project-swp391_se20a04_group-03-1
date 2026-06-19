import { ProviderLayout } from "@/components/layout/provider-layout"

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProviderLayout>{children}</ProviderLayout>
}
