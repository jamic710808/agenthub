"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <header className="flex h-[64px] items-center border-b border-border-subtle bg-bg-base px-[24px]">
        <Link href="/" className="flex items-center gap-[8px] text-[16px] font-semibold text-fg-default">
          <Bot className="h-[24px] w-[24px] text-primary-default" />
          <span className="font-mono">AgentHub</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-[24px] py-[48px]">
        <Card className="w-full max-w-[400px]">
          <CardHeader className="text-center">
            <CardTitle className="text-[24px]">建立帳號</CardTitle>
            <CardDescription>開始使用 AgentHub</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-[16px]">
            {success ? (
              <div className="rounded-[8px] bg-green-50 p-[12px] text-[14px] text-green-600">
                註冊成功！請檢查你的電子郵件來驗證帳號。
              </div>
            ) : (
              <>
                {error && (
                  <div className="rounded-[8px] bg-red-50 p-[12px] text-[14px] text-red-600">
                    {error}
                  </div>
                )}
                <form onSubmit={handleRegister} className="grid gap-[16px]">
                  <div className="grid gap-[8px]">
                    <Label htmlFor="name">名稱</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="你的名稱"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-[8px]">
                    <Label htmlFor="email">電子郵件</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-[8px]">
                    <Label htmlFor="password">密碼</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '註冊中...' : '註冊'}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-[16px]">
            <p className="text-center text-[14px] text-fg-secondary">
              已有帳號？<Link href="/login" className="text-primary-default hover:underline">立即登入</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}