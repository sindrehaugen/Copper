import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface SpaceHierarchyProps {
  campusId?: string;
  className?: string;
  onNavigate?: (path: string, entity?: any) => void;
}

// Mock hierarchical data
const mockCampus = {
  id: 'CAMP-OSLO',
  name: 'Oslo HQ',
  buildings: [
    {
      id: 'BLD-A',
      name: 'North Tower',
      floors: [
        {
          id: 'FL-1',
          name: 'Ground Floor',
          rooms: [
            { id: 'RM-101', name: 'Reception', assetCount: 12 },
            { id: 'RM-102', name: 'Main Cafe', assetCount: 45 },
          ]
        },
        {
          id: 'FL-2',
          name: 'Level 2 Workspace',
          rooms: [
            { id: 'RM-201', name: 'Open Plan Alpha', assetCount: 156 },
            { id: 'RM-202', name: 'Meeting Room 2A', assetCount: 8 },
            { id: 'RM-203', name: 'Server Room', assetCount: 342 },
          ]
        }
      ]
    },
    {
      id: 'BLD-B',
      name: 'South Annex',
      floors: [
        {
          id: 'FL-B1',
          name: 'Basement Storage',
          rooms: [
            { id: 'RM-B10', name: 'IT Storage', assetCount: 1045 },
          ]
        }
      ]
    }
  ]
};

export function SpaceHierarchy({ campusId = 'CAMP-OSLO', className = '', onNavigate }: SpaceHierarchyProps) {
  const { t } = useTranslation();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'CAMP-OSLO': true,
    'BLD-A': true,
    'FL-2': true
  });

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={`flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 p-5 ${className}`} data-testid="space-hierarchy-surface">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {t('spaces.hierarchy.title', 'Space Navigator: {{campus}}', { campus: mockCampus.name })}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('spaces.hierarchy.desc', 'Drill-down view mapping spaces to physical assets.')}
        </p>
      </header>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1 overflow-auto">
        
        {/* Campus Root */}
        <div className="font-mono text-sm">
          <div 
            className="flex items-center gap-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer rounded px-2 font-bold text-slate-900 dark:text-white"
            onClick={() => toggleNode(mockCampus.id)}
          >
            <span className="w-4 text-center">{expandedNodes[mockCampus.id] ? '▾' : '▸'}</span>
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            {mockCampus.name}
          </div>
          
          {expandedNodes[mockCampus.id] && (
            <div className="ml-6 border-l border-slate-200 dark:border-slate-800 pl-2">
              {mockCampus.buildings.map(bldg => (
                <div key={bldg.id}>
                  {/* Building Node */}
                  <div 
                    className="flex items-center gap-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer rounded px-2 font-semibold text-slate-800 dark:text-slate-200"
                    onClick={() => toggleNode(bldg.id)}
                  >
                    <span className="w-4 text-center text-slate-400">{expandedNodes[bldg.id] ? '▾' : '▸'}</span>
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    {bldg.name}
                  </div>
                  
                  {expandedNodes[bldg.id] && (
                    <div className="ml-6 border-l border-slate-200 dark:border-slate-800 pl-2">
                      {bldg.floors.map(floor => (
                        <div key={floor.id}>
                          {/* Floor Node */}
                          <div 
                            className="flex items-center gap-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer rounded px-2 font-medium text-slate-700 dark:text-slate-300"
                            onClick={() => toggleNode(floor.id)}
                          >
                            <span className="w-4 text-center text-slate-400">{expandedNodes[floor.id] ? '▾' : '▸'}</span>
                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                            {floor.name}
                          </div>

                          {expandedNodes[floor.id] && (
                            <div className="ml-6 border-l border-slate-200 dark:border-slate-800 pl-2 py-1">
                              {floor.rooms.map(room => (
                                <div key={room.id} className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded group">
                                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <span className="w-4"></span>
                                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                                    <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400 cursor-pointer" onClick={() => onNavigate?.(`/spaces/${room.id}`, { type: 'ROOM' })}>
                                      {room.id} - {room.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className="text-slate-400">{t('spaces.hierarchy.assets', 'Assets:')}</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                      {room.assetCount}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
