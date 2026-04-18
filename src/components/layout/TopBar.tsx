interface TopBarProps {
  title: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, actions }: TopBarProps) {
  return (
    <div className="flex items-center justify-between border-b px-6 py-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
