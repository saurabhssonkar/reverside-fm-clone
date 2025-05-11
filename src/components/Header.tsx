
import React from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  sessionName: string;
  onInvite: () => void;
}

const Header = ({ sessionName, onInvite }: HeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex items-center justify-between p-2 sm:p-4 bg-riverside-background border-b border-riverside-border">
      <div className="flex items-center">
        <div className="mr-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#FF4742" />
            <path d="M7 12H17M7 8H17M7 16H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{sessionName}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        {!isMobile && (
          <Button 
            variant="outline" 
            onClick={onInvite}
            className="border-riverside-border text-sm"
          >
            Invite
          </Button>
        )}
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
          L
        </div>
      </div>
    </div>
  );
};

export default Header;
