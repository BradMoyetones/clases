'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Eye, Smartphone, Monitor, Maximize2, LockKeyhole } from 'lucide-react';

type DeviceMode = 'mobile' | 'tablet' | 'desktop' | 'custom';

interface PreviewModalProps {
    src: string;
    title?: string;
}

const devicePresets = {
    mobile: {
        label: 'Móvil',
        width: 375,
        icon: Smartphone,
    },
    tablet: {
        label: 'Tablet',
        width: 768,
        icon: Monitor,
    },
    desktop: {
        label: 'Escritorio',
        width: 1920,
        icon: Monitor,
    },
};

export function PreviewModal({ src, title = 'Preview' }: PreviewModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
    const [customWidth, setCustomWidth] = useState(1920);

    const currentWidth =
        deviceMode === 'custom' ? customWidth : devicePresets[deviceMode as keyof typeof devicePresets].width;

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2"
                aria-label="Abrir vista previa en diferentes dispositivos"
                title="Previsualizar en diferentes tamaños y dispositivos"
            >
                <Eye className="size-4" />
                <span>Preview</span>
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[98vw]! w-full h-[98vh] flex flex-col p-0 gap-0">
                    {/* Header */}
                    <DialogHeader className="bg-muted px-2 py-2.5 rounded-t-lg flex flex-row items-center gap-2">
                        <div className="flex items-center gap-2">
                            <div className="size-3 bg-red-400 aspect-square rounded-full" />
                            <div className="size-3 bg-yellow-300/80 aspect-square rounded-full" />
                            <div className="size-3 bg-green-600 aspect-square rounded-full" />
                        </div>
                        <div className="flex items-center text-muted-foreground gap-2 px-2 py-1 border rounded mx-auto max-w-[50vw] w-full overflow-auto">
                            <LockKeyhole className="size-4 shrink-0" />
                            <DialogTitle className="text-sm">
                                {process.env.NEXT_PUBLIC_APP_URL}/{title}
                            </DialogTitle>
                        </div>
                    </DialogHeader>

                    {/* Device selector */}
                    <div className="flex gap-2 border-b px-4 py-2 flex-wrap">
                        {Object.entries(devicePresets).map(([key, preset]) => {
                            const Icon = preset.icon;
                            return (
                                <Button
                                    key={key}
                                    onClick={() => setDeviceMode(key as DeviceMode)}
                                    variant={deviceMode === key ? 'default' : 'outline'}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Icon className="size-4" />
                                    {preset.label}
                                </Button>
                            );
                        })}
                        <Button
                            onClick={() => setDeviceMode('custom')}
                            variant={deviceMode === 'custom' ? 'default' : 'outline'}
                            size="sm"
                            className="gap-2"
                        >
                            <Maximize2 className="size-4" />
                            Personalizado
                        </Button>
                    </div>

                    {/* Custom width input */}
                    {deviceMode === 'custom' && (
                        <div className="flex gap-4 border-b px-4 py-2 items-center">
                            <div className="flex items-center gap-2">
                                <label htmlFor="width" className="text-sm font-medium">
                                    Ancho:
                                </label>
                                <input
                                    id="width"
                                    type="number"
                                    min="0"
                                    value={customWidth === 0 ? '' : customWidth}
                                    onChange={(e) => setCustomWidth(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-20 px-2 py-1 text-sm border rounded"
                                />
                                <span className="text-xs text-muted-foreground">px</span>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-hidden">
                        <ResizablePanelGroup direction="horizontal" className="h-full">
                            <ResizablePanel
                                defaultSize={100}
                                minSize={20}
                                style={{ width: `${currentWidth}px` }}
                                className="flex items-center justify-center bg-muted/20"
                            >
                                <div
                                    className="bg-background shadow-md overflow-hidden"
                                    style={{
                                        width: `${currentWidth}px`,
                                        height: '100%',
                                    }}
                                >
                                    <iframe
                                        src={src}
                                        className="w-full h-full border-0"
                                        loading="lazy"
                                        title={`Preview - ${title}`}
                                    />
                                </div>
                            </ResizablePanel>

                            <ResizableHandle withHandle />
                            <ResizablePanel className="flex-1"></ResizablePanel>
                        </ResizablePanelGroup>
                    </div>

                    {/* Dimensions footer */}
                    <div className="border-t px-6 py-2 text-xs text-muted-foreground text-center">
                        {currentWidth} px de ancho
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
