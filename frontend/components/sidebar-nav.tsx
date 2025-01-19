import { Home, Search, MessageSquare, Bell, User, Settings, Swords, Flame, Bitcoin, LogInIcon, Egg } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useNotification } from "@/contexts/notification-context";
import {useContext, useState} from "react";
import {QuestContext} from "@/contexts/QuestContext";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

export function SidebarNav() {
  const { user } = useAuth();
  const { unreadCount, resetUnread } = useNotification();
  const pathname = usePathname();
  const router = useRouter();

  let navItems = [
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/search", icon: Search, label: "Recherche" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
    {
      href: "/notifications",
      icon: Bell,
      label: "Notifications",
      badge: unreadCount,
    },
    { href: "/anarchie", icon: Flame, label: "Anarchie" },
    { href: "/pixelWar", icon: Swords, label: "Pixel War" },
    { href: "/easter-egg", icon: Egg, label: "Easter Egg" },
    { href: user ? `/users/${user.address}` : "/login", icon: User, label: "Mon Profil" },
    { href: "/cryptos", icon: Bitcoin, label: "Cryptos" },
    { href: "/settings", icon: Settings, label: "Paramètres" },

  ];

  const { currentStep, completeStep, TOTAL_STEPS } = useContext(QuestContext);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showModal, setShowModal] = useState(false);



  function handleLogoClick() {
    if (currentStep < TOTAL_STEPS) return;
    setLogoClicks((c) => c + 1);

    if (logoClicks + 1 === 10) {
      setShowModal(true);
      setLogoClicks(0);
    }
  }

 
  if(!user) {
    navItems = [{ href: '/login', icon: LogInIcon, label: 'Connexion' }]
  }

  const handleNavigation = (href: string) => {
    if (href === "/notifications") resetUnread(); // Réinitialise les notifications non lues
    router.push(href);
  };

  return (
    <div className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-background border-r border-border">
      <div className="p-4">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2" onClick={handleLogoClick}>
          <span className="flex gap-0.5">
            <span className="block w-2 h-2 bg-foreground"></span>
            <span className="block w-2 h-2 bg-foreground"></span>
          </span>
          BlockTweet
        </h1>
      </div>
      <nav className="flex-1 px-2">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => handleNavigation(item.href)}
            className={cn(
              "flex items-center gap-4 px-4 py-3 text-lg rounded-lg transition-colors w-full text-left",
              pathname === item.href
                ? "text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
              <item.icon className="h-6 w-6" />
              {item.badge > 0 && (
                <div className="relative">
                  {/* Badge pour l'icône */}
                  <div className="absolute -top-0 -right-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs">
                    
                    {item.badge > 20 && (
                      <p>20+</p>
                    )}

                    {item.badge < 21 && (
                      <p>{item.badge}</p>
                    )}
                  </div>
                </div>
              )}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      {showModal && (
          <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
          >
            <div style={{ padding: '2rem', borderRadius: '8px' }}>
              <h2 className="text-2xl font-extrabold dark:text-white">Bravo, tu as trouvé tous les Easter Eggs !</h2>
              <p>Entre maintenant le mot de passe final pour révéler le trésor :</p>
              <PasswordForm onClose={() => setShowModal(false)} />
            </div>
          </div>
      )}
    </div>

  );
}

function PasswordForm({ onClose }) {
  const { FINAL_PASSWORD } = useContext(QuestContext);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');
  const [showBalloons, setShowBalloons] = useState(false); // Nouvel état pour afficher les ballons

  function handleSubmit(e) {
    e.preventDefault();
    if (inputValue === FINAL_PASSWORD) {
      setMessage('Félicitations ! Tu as trouvé le trésor :) essaye de gratter un 20/20 à ton prochain examen !');
      setShowBalloons(true); // Afficher les ballons
    } else {
      setMessage('Mot de passe incorrect.');
    }
  }

  return (
      <div>
        <form onSubmit={handleSubmit}>
          <Input
              type="password"
              placeholder="Tape le mot de passe"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
          />
          <Button type="submit">Valider</Button>
          <Button type="button" onClick={onClose}>
            Fermer
          </Button>
          <p>{message}</p>
        </form>
      </div>
  );
}
