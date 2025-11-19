import { Icon as IconType } from '@/lib/languajes';
import { cn } from '@/lib/utils';

type BadgeProps = {
    lang: string;
    className?: string;
    icon?: IconType;
} & React.HTMLAttributes<HTMLSpanElement>;
type BadgeFC = React.FC<BadgeProps>;
const Badge: BadgeFC = ({ lang, className, icon: Icon, ...props }) => {
    return (
        <span
            key={lang}
            className={cn(className, 'flex items-center gap-2 w-fit rounded-full px-1.5 py-0.5')}
            {...props}
        >
            {Icon ? <Icon className="size-4" /> : null}
            {lang}
        </span>
    );
};

export default Badge;
