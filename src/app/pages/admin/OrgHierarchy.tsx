import { Box } from '@mui/material';
import { Building2, Users, User } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SurfaceCard from '../../components/common/SurfaceCard';

export default function OrgHierarchy() {
  const orgStructure = [
    {
      name: 'Company',
      type: 'company',
      children: [
        {
          name: 'Engineering',
          type: 'department',
          children: [
            {
              name: 'Ananya Iyer',
              type: 'manager',
              children: [
                { name: 'Aarav Sharma', type: 'employee' },
                { name: 'Meera Nair', type: 'employee' },
                { name: 'Kabir Singh', type: 'employee' },
              ],
            },
          ],
        },
        {
          name: 'Product',
          type: 'department',
          children: [
            {
              name: 'Diya Verma',
              type: 'manager',
              children: [
                { name: 'Arjun Reddy', type: 'employee' },
                { name: 'Priya Menon', type: 'employee' },
              ],
            },
          ],
        },
        {
          name: 'Sales',
          type: 'department',
          children: [
            {
              name: 'Rohan Desai',
              type: 'manager',
              children: [
                { name: 'Saanvi Kulkarni', type: 'employee' },
                { name: 'Sunil Gohel', type: 'employee' },
              ],
            },
          ],
        },
      ],
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'company':
        return <Building2 size={20} color="#1976d2" />;
      case 'department':
        return <Users size={18} color="#1976d2" />;
      case 'manager':
        return <User size={16} color="#2e7d32" />;
      default:
        return <User size={16} color="#64748b" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'company':
        return 'var(--phoenix-surface-muted)';
      case 'department':
        return 'rgba(239, 246, 255, 0.9)';
      case 'manager':
        return 'rgba(46, 125, 50, 0.08)';
      default:
        return 'var(--phoenix-surface)';
    }
  };

  const renderNode = (node: { name: string; type: string; children?: typeof orgStructure }, level: number = 0) => (
    <Box key={node.name} sx={{ ml: level * 3 }}>
      <Box
        sx={{
          p: 2,
          mb: 1.5,
          bgcolor: getColor(node.type),
          borderRadius: 'var(--phoenix-radius-sm)',
          border: '1px solid var(--phoenix-border)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1.5,
          minWidth: 220,
          boxShadow: 'var(--phoenix-shadow-sm)',
          transition: 'transform var(--phoenix-transition), box-shadow var(--phoenix-transition)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 'var(--phoenix-shadow-md)',
          },
        }}
      >
        {getIcon(node.type)}
        <Box>
          <Box sx={{ fontWeight: 700, fontSize: 14, color: 'var(--phoenix-text-primary)' }}>{node.name}</Box>
          <Box sx={{ fontSize: 11, color: 'var(--phoenix-text-tertiary)', textTransform: 'capitalize' }}>
            {node.type}
          </Box>
        </Box>
      </Box>
      {node.children && (
        <Box sx={{ ml: 2, borderLeft: '2px solid var(--phoenix-highlight)', pl: 2.5, mt: 1 }}>
          {node.children.map((child) => renderNode(child, level + 1))}
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      <PageHeader
        title="Organization Hierarchy"
        subtitle="Visual representation of company structure and reporting relationships"
      />

      <SurfaceCard>
        <Box sx={{ fontSize: 'var(--phoenix-text-section)', fontWeight: 700, mb: 3, color: 'var(--phoenix-text-primary)' }}>
          Company Structure
        </Box>
        <Box sx={{ overflowX: 'auto', pb: 2 }}>
          {orgStructure.map((node) => renderNode(node))}
        </Box>
      </SurfaceCard>
    </Box>
  );
}
