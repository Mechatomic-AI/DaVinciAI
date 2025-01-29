import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  GitHubLogoIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons'
import { Session } from '@supabase/supabase-js'
import { ArrowRight, Trash, Undo } from 'lucide-react'
import { LogoSVG } from './logo-svg'
import { ChainString } from './chain-string'

export function NavBar({
  session,
  showLogin,
  signOut,
  onClear,
  canClear,
  onSocialClick,
  onUndo,
  canUndo,
}: {
  session: Session | null
  showLogin: () => void
  signOut: () => void
  onClear: () => void
  canClear: boolean
  onSocialClick: (target: 'github' | 'x' | 'telegram') => void
  onUndo: () => void
  canUndo: boolean
}) {
  return (
    <nav className="w-full flex py-4">
      <div className="flex flex-1 items-center">
        <a href="/" className="flex items-center gap-2">
          <LogoSVG />
        </a>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <ChainString />
      </div>
      <div className="flex flex-1 items-center gap-1 md:gap-4 justify-end">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                disabled={!canClear}
              >
                <Trash className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear chat</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {session ? (
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={
                          session.user.user_metadata?.avatar_url ||
                          'https://avatar.vercel.sh/' + session.user.email
                        }
                        alt={session.user.email}
                      />
                    </Avatar>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem onClick={() => onSocialClick('github')}>
                <GitHubLogoIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                Get it from GitHub
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSocialClick('telegram')}>
                <svg className="mr-2 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50">
                  <path fill='#a1a1aa' d="M25,2c12.703,0,23,10.297,23,23S37.703,48,25,48S2,37.703,2,25S12.297,2,25,2z M32.934,34.375	c0.423-1.298,2.405-14.234,2.65-16.783c0.074-0.772-0.17-1.285-0.648-1.514c-0.578-0.278-1.434-0.139-2.427,0.219	c-1.362,0.491-18.774,7.884-19.78,8.312c-0.954,0.405-1.856,0.847-1.856,1.487c0,0.45,0.267,0.703,1.003,0.966	c0.766,0.273,2.695,0.858,3.834,1.172c1.097,0.303,2.346,0.04,3.046-0.395c0.742-0.461,9.305-6.191,9.92-6.693	c0.614-0.502,1.104,0.141,0.602,0.644c-0.502,0.502-6.38,6.207-7.155,6.997c-0.941,0.959-0.273,1.953,0.358,2.351	c0.721,0.454,5.906,3.932,6.687,4.49c0.781,0.558,1.573,0.811,2.298,0.811C32.191,36.439,32.573,35.484,32.934,34.375z"></path>
                </svg>
                Join us on Telegram
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSocialClick('x')}>
                <TwitterLogoIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                Follow us on X
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="default" onClick={showLogin}>
            Sign in
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </nav>
  )
}
