import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  templates: string[];
  isLoading?: boolean;
}

export function MessageTemplateDialog({
  open,
  onOpenChange,
  clientName,
  templates,
  isLoading,
}: MessageTemplateDialogProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Mensagens para {clientName}
          </DialogTitle>
          <DialogDescription>
            Selecione e copie uma mensagem para enviar ao cliente.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Gerando mensagens...</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhuma mensagem disponível
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template, i) => (
              <div
                key={i}
                className="relative bg-muted/40 rounded-xl p-4 border border-border hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Modelo {i + 1}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{template}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      'flex-shrink-0 h-8 w-8 transition-all',
                      copiedIndex === i && 'bg-green-50 border-green-300 text-green-600 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400'
                    )}
                    onClick={() => handleCopy(template, i)}
                  >
                    {copiedIndex === i ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
