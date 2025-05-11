
import React from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";

interface ParticipantItemProps {
  name: string;
  role: string;
  resolution: string;
  avatar: string;
}

const ParticipantItem = ({ name, role, resolution, avatar }: ParticipantItemProps) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-riverside-border">
      <div className="flex items-center space-x-3">
        <img src={avatar} alt={name} className="w-8 h-8 rounded-full" />
        <div>
          <div className="flex items-center">
            <div className="font-medium">{name}</div>
            <div className="ml-2 text-xs text-riverside-textSecondary">{role}</div>
          </div>
          <div className="text-xs text-riverside-textSecondary">{resolution}</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="w-16 sm:w-20 h-1 bg-riverside-border rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-green-500"></div>
        </div>
        <Button variant="ghost" size="icon" className="text-riverside-textSecondary">
          <ChevronDown size={16} />
        </Button>
      </div>
    </div>
  );
};

interface SidePanelProps {
  onClose: () => void;
}

const SidePanel = ({ onClose }: SidePanelProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'w-[85%] ml-auto h-full' : 'w-[300px]'} bg-riverside-panel border-l border-riverside-border h-full overflow-y-auto`}>
      <div className="p-4 border-b border-riverside-border flex items-center justify-between">
        <h3 className="font-bold uppercase text-xs tracking-wider">Recording Overview</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-riverside-textSecondary">
          <X size={18} />
        </Button>
      </div>
      
      <div className="p-4 border-b border-riverside-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Lumix Unboxing</h3>
          <Button variant="ghost" size="sm" className="h-6 text-xs">
            <span className="mr-1">✏️</span>
          </Button>
        </div>
        <div className="text-xs text-riverside-textSecondary mb-2">
          Audio & Video • 1080p (720p live)
        </div>
        <div className="flex items-center text-xs text-riverside-textSecondary">
          <span>You and 1 other</span>
          <Button variant="ghost" size="sm" className="h-6 text-xs ml-auto">
            Invite
          </Button>
        </div>
      </div>
      
      <div className="p-4 border-b border-riverside-border">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm">Noise reduction for all</div>
          <Switch />
        </div>
        
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-riverside-accent text-white flex items-center justify-center text-xs mr-2">A</div>
            <div className="text-sm">Low data mode</div>
          </div>
          <ChevronDown size={16} className="text-riverside-textSecondary" />
        </div>
      </div>
      
      <div className="p-4">
        <ParticipantItem 
          name="Jeff" 
          role="Host" 
          resolution="1080p" 
          avatar="/lovable-uploads/bfd4fd1c-a10e-46dd-8a45-425e2eb05e13.png"
        />
        
        <ParticipantItem 
          name="Laura Figueroa" 
          role="Guest" 
          resolution="720p"
          avatar="/lovable-uploads/bfd4fd1c-a10e-46dd-8a45-425e2eb05e13.png" 
        />
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">Echo cancellation</div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">Echo cancellation</div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
