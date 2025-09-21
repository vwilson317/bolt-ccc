import React from 'react';
import { BarracaMenu } from '../types/menu';

interface BarracaMenuProps {
  menu: BarracaMenu;
}

const BarracaMenuComponent: React.FC<BarracaMenuProps> = ({ menu }) => {
  return (
    <div className="mb-8 md:mb-16">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
        <span className="text-sm text-gray-500">{menu.language.toUpperCase()}</span>
      </div>

      <div className="space-y-6">
        {menu.sections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate" style={{ borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-gray-500 py-2 pr-4">Item</th>
                    <th className="text-left text-sm font-medium text-gray-500 py-2 pr-4">Size</th>
                    <th className="text-left text-sm font-medium text-gray-500 py-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 pr-4 text-gray-900">{item.name}</td>
                      <td className="py-2 pr-4 text-gray-600">{item.size || '-'}</td>
                      <td className="py-2 text-beach-700 font-medium">{item.price || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarracaMenuComponent;


