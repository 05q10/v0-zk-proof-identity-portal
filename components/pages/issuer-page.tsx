"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"
import { Shield, Plus, XCircle, RefreshCw, UserCheck } from "lucide-react"
import { useUserStore, type Credential } from "../../store/user-store"
import { fakeApiCall, formatDate, generateHash } from "../../utils/helpers"
import { toast } from "sonner@2.0.3"
import { Alert, AlertDescription } from "../ui/alert"

export function IssuerPage() {
  const { users, credentials, addCredential, revokeCredential } = useUserStore()
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [revocationRoot, setRevocationRoot] = useState(generateHash("initial-root"))
  const [updating, setUpdating] = useState(false)

  // Issue credential form
  const [newCredential, setNewCredential] = useState({
    userId: "",
    type: "",
    expiryDays: 365,
  })

  const handleIssueCredential = async () => {
    if (!newCredential.userId || !newCredential.type) {
      toast.error("Please fill all required fields")
      return
    }

    toast.loading("Issuing credential...")
    await fakeApiCall(1500)

    const credential: Credential = {
      id: `CRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: newCredential.userId,
      type: newCredential.type,
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + newCredential.expiryDays * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
    }

    addCredential(credential)
    setIsIssueModalOpen(false)
    toast.dismiss()
    toast.success("Credential issued successfully!")

    setNewCredential({ userId: "", type: "", expiryDays: 365 })
  }

  const handleRevoke = async (credentialId: string) => {
    toast.loading("Revoking credential...")
    await fakeApiCall(1000)

    revokeCredential(credentialId)
    toast.dismiss()
    toast.success("Credential revoked successfully")
  }

  const handleUpdateRoot = async () => {
    setUpdating(true)
    toast.loading("Updating revocation root on blockchain...")
    await fakeApiCall(2000)

    const newRoot = generateHash("new-root-" + Date.now())
    setRevocationRoot(newRoot)
    setUpdating(false)
    toast.dismiss()
    toast.success("Revocation root updated successfully!")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full mb-4">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600 dark:text-blue-400">Credential Issuer Portal</span>
            </div>
            <h1>Issuer Dashboard</h1>
            <p className="text-muted-foreground">Manage credentials and revocation status</p>
          </div>

          <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Plus className="mr-2 h-4 w-4" />
                Issue New Credential
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Issue New Credential</DialogTitle>
                <DialogDescription>Create and issue a new credential to a registered user</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User</Label>
                  <Select
                    value={newCredential.userId}
                    onValueChange={(value) => setNewCredential((prev) => ({ ...prev, userId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.personalInfo.name} ({user.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Credential Type</Label>
                  <Select
                    value={newCredential.type}
                    onValueChange={(value) => setNewCredential((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Government ID Credential">Government ID Credential</SelectItem>
                      <SelectItem value="Age Verification">Age Verification</SelectItem>
                      <SelectItem value="Address Proof">Address Proof</SelectItem>
                      <SelectItem value="Professional Credential">Professional Credential</SelectItem>
                      <SelectItem value="Education Credential">Education Credential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDays">Expiry (Days)</Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    value={newCredential.expiryDays}
                    onChange={(e) =>
                      setNewCredential((prev) => ({ ...prev, expiryDays: Number.parseInt(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsIssueModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleIssueCredential} className="bg-gradient-to-r from-blue-500 to-purple-600">
                  Issue Credential
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Revocation Root Card */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h3 className="mb-2">Blockchain Revocation Root</h3>
              <code className="text-xs break-all bg-background/50 p-2 rounded border block">{revocationRoot}</code>
              <p className="text-sm text-muted-foreground mt-2">
                This root is stored on-chain and updated when credentials are revoked
              </p>
            </div>
            <Button
              onClick={handleUpdateRoot}
              disabled={updating}
              variant="outline"
              className="whitespace-nowrap bg-transparent"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${updating ? "animate-spin" : ""}`} />
              {updating ? "Updating..." : "Update Root"}
            </Button>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl">{users.length}</p>
                <p className="text-sm text-muted-foreground">Registered Users</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl">{credentials.filter((c) => c.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Active Credentials</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl">{credentials.filter((c) => c.status === "revoked").length}</p>
                <p className="text-sm text-muted-foreground">Revoked Credentials</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Registered Users Table */}
        <Card className="p-6">
          <h2 className="mb-4">Registered Users</h2>
          {users.length === 0 ? (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                No users registered yet. Users will appear here after completing registration.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Credentials</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-sm">{user.id}</TableCell>
                      <TableCell>{user.personalInfo.name}</TableCell>
                      <TableCell>{user.personalInfo.email}</TableCell>
                      <TableCell>{user.personalInfo.age}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>{credentials.filter((c) => c.userId === user.id).length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Credentials Table */}
        <Card className="p-6">
          <h2 className="mb-4">All Credentials</h2>
          {credentials.length === 0 ? (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                No credentials issued yet. Click "Issue New Credential" to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credential ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credentials.map((credential) => {
                    const user = users.find((u) => u.id === credential.userId)
                    return (
                      <TableRow key={credential.id}>
                        <TableCell className="font-mono text-sm">{credential.id}</TableCell>
                        <TableCell>{user?.personalInfo.name || "Unknown"}</TableCell>
                        <TableCell>{credential.type}</TableCell>
                        <TableCell>{formatDate(credential.issueDate)}</TableCell>
                        <TableCell>{formatDate(credential.expiryDate)}</TableCell>
                        <TableCell>
                          <Badge variant={credential.status === "active" ? "default" : "destructive"}>
                            {credential.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {credential.status === "active" && (
                            <Button variant="destructive" size="sm" onClick={() => handleRevoke(credential.id)}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Revoke
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
