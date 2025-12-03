import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Mail, UserCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { OrganizerPanel } from '@/components/OrganizerPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockEvents } from '@/data/mockEvents';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  addedDate: string;
}

export default function MemberPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'Check-in Staff',
      addedDate: '2024-11-15',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      role: 'Check-in Staff',
      addedDate: '2024-11-18',
    },
  ]);
  
  const event = mockEvents.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl mb-4">Event not found</h2>
          <Button onClick={() => navigate('/organize')}>
            Back to Dashboard
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newMember: Member = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: 'Check-in Staff',
      addedDate: new Date().toISOString().split('T')[0],
    };
    setMembers([...members, newMember]);
    setShowAddForm(false);
    e.currentTarget.reset();
  };

  const removeMember = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <OrganizerPanel />

        <div className="flex-1 py-8 px-8">
          <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/organize')}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold mb-2">Team Members</h1>
            <p className="text-muted-foreground">Manage check-in staff for {event.title}</p>
          </div>

          <div>
            {/* Add Member Button */}
            <div className="mb-6">
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                variant="cta"
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Member
              </Button>
            </div>

            {/* Add Member Form */}
            {showAddForm && (
              <div className="glass glass-border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Add New Member</h2>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="ghost"
                    size="icon"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter member's full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="member@example.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      name="role"
                      type="text"
                      value="Check-in Staff"
                      disabled
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="cta"
                    >
                      Add Member
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Members List */}
            <div className="glass glass-border rounded-xl">
              <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold">Current Members ({members.length})</h2>
              </div>
              
              {members.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <UserCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No team members added yet</p>
                  <p className="text-sm mt-2">Click "Add Member" to invite check-in staff</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {members.map((member) => (
                    <div key={member.id} className="p-6 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium mb-1">{member.name}</div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span>{member.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Role</div>
                            <div className="text-sm">{member.role}</div>
                          </div>
                          <Button
                            onClick={() => removeMember(member.id)}
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
