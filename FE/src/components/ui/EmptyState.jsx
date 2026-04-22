export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && <Icon className="w-12 h-12 text-gray-300 mb-4" />}
    <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-500 mb-6 max-w-xs">{description}</p>}
    {action}
  </div>
);
