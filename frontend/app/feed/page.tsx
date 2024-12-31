import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Feed() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Fil d'actualités</h1>
      <div className="space-y-4">
        {[1, 2, 3].map((post) => (
          <Card key={post}>
            <CardHeader>
              <CardTitle>Post {post}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Contenu du post...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

