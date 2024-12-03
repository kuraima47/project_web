import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      if (response.ok) {
        navigate("/login"); // Redirect to login
      } else {
        alert("Error during registration");
      }
    } catch (error) {
      console.error("Signup error", error);
    }
  };

  return (
    <div className="form-container">
      <div className="form-center items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Signup</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-4"
              />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mb-4"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-4"
              />
              <Button type="submit" className="w-full">Signup</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
