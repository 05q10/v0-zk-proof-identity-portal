export function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground flex items-center justify-between">
        <span>© {new Date().getFullYear()} ZK-ProofID</span>
        <span className="hidden sm:inline">Privacy-preserving identity with ZK-proofs (demo)</span>
      </div>
    </footer>
  )
}
