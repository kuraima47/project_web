import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Profile() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Adresse: 0x1234...5678</p>
          <p className="mb-4">Solde: 100 BTC</p>
          <Button>Modifier le profil</Button>
        </CardContent>
      </Card>
    </div>
  )
}

