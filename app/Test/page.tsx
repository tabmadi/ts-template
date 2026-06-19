'use client';
import { useState } from 'react';
import { Terminal, AlertCircle, Check, Settings, User, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Test() {
    const [switchState, setSwitchState] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [showDialog, setShowDialog] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
                <div className="text-center flex flex-col gap-2">
                    <h1 className="text-4xl font-bold text-foreground">UI Components Test Page</h1>
                    <p className="text-muted-foreground">Custom components built with shadcn/ui</p>
                </div>

                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-foreground">Alerts</h2>

                    <Alert className="flex">
                        <Terminal className="h-4 w-4" />
                        <div className="flex-col">
                        <AlertTitle>Default Alert</AlertTitle>
                        <AlertDescription>
                            This is a default alert with an icon and description.
                        </AlertDescription>
                        </div>
                    </Alert>

                    <Alert className="flex" variant="destructive">
                        <AlertCircle className="h-4 w-4"/>
                        <div className="flex-col">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                Your session has expired. Please log in again.
                            </AlertDescription>
                        </div>
                    </Alert>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Account</CardTitle>
                            <CardDescription>
                                Enter your details below to create your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={inputValue}
                                    onChange={(e: any) => setInputValue(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="guest">Guest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Create Account</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Settings
                            </CardTitle>
                            <CardDescription>
                                Manage your preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-y-0 py-2">
                                <div className="space-y-0.5">
                                    <Label htmlFor="email-notifications">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive emails about your account activity
                                    </p>
                                </div>
                                <Switch
                                    className="bg-black"
                                    id="email-notifications"
                                    checked={switchState}
                                    onCheckedChange={setSwitchState}
                                />
                            </div>
                            <div className="flex items-center justify-between space-y-0 py-2">
                                <div className="space-y-0.5">
                                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive emails about new features
                                    </p>
                                </div>
                                <Switch className="bg-black" id="marketing-emails" />
                            </div>
                            <div className="pt-4">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    Status:
                                    {switchState ? (
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                            <Check className="h-3 w-3 mr-1" />
                                            Enabled
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Disabled</Badge>
                                    )}
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button variant="outline" className="flex-1 bg-red-100">Cancel</Button>
                            <Button className="flex-1 bg-green-100">Save Changes</Button>
                        </CardFooter>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Buttons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-5">
                            <Button className="bg-blue-500">Default</Button>
                            <Button className="bg-cyan-200" variant="secondary">Secondary</Button>
                            <Button className="bg-amber-50" variant="outline">Outline</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Alert Dialog</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" onClick={() => setShowDialog(true)}>
                            Delete Account
                        </Button>
                    </CardContent>
                </Card>

                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDialog(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={() => setShowDialog(false)}>
                                Continue
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {inputValue && (
                    <Alert className="bg-green-50 flex gap-10 border-green-200">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Input Test</AlertTitle>
                        <AlertDescription className="text-green-700 flex">
                            You typed: <strong>{inputValue}</strong>
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
}