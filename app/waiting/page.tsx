import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CheckCircle2 } from "lucide-react"

export default function WaitingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center py-6">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Clock className="size-16 text-blue-500 animate-pulse" />
              <CheckCircle2 className="size-6 text-green-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Request Submitted</CardTitle>
          <CardDescription className="text-base">
            Your leader account has been created successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground text-left space-y-2 border border-border">
            <p className="font-semibold text-foreground">What happens next?</p>
            <p>1. An administrator will review your registration request.</p>
            <p>2. Once approved, you will be able to sign in with your email and password.</p>
            <p>3. This process usually takes a few minutes during event hours.</p>
          </div>
          
          <div className="pt-2">
            <Link href="/">
              <Button variant="outline" className="w-full">
                Return to Login
              </Button>
            </Link>
          </div>
          
          <p className="text-xs text-muted-foreground italic">
            Thank you for your patience and for your service with Earthsguard.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
