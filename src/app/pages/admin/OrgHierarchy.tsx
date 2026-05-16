import { Box, Card, CardContent } from '@mui/material';
import { Building2, Users, User } from 'lucide-react';

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
              name: 'Sarah Johnson',
              type: 'manager',
              children: [
                { name: 'John Smith', type: 'employee' },
                { name: 'Jane Doe', type: 'employee' },
                { name: 'Mike Johnson', type: 'employee' },
              ],
            },
          ],
        },
        {
          name: 'Product',
          type: 'department',
          children: [
            {
              name: 'Emily Chen',
              type: 'manager',
              children: [
                { name: 'Alex Kim', type: 'employee' },
                { name: 'Sam Taylor', type: 'employee' },
              ],
            },
          ],
        },
        {
          name: 'Sales',
          type: 'department',
          children: [
            {
              name: 'Robert Davis',
              type: 'manager',
              children: [
                { name: 'Lisa Wong', type: 'employee' },
                { name: 'David Lee', type: 'employee' },
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
        return <Building2 size={20} color="#9c27b0" />;
      case 'department':
        return <Users size={18} color="#1976d2" />;
      case 'manager':
        return <User size={16} color="#2e7d32" />;
      default:
        return <User size={16} color="#666" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'company':
        return '#f3e5f5';
      case 'department':
        return '#e3f2fd';
      case 'manager':
        return '#e8f5e9';
      default:
        return '#f5f5f5';
    }
  };

  const renderNode = (node: any, level: number = 0) => (
    <Box key={node.name} sx={{ ml: level * 4 }}>
      <Box
        sx={{
          p: 2,
          mb: 1,
          bgcolor: getColor(node.type),
          borderRadius: 1,
          border: '1px solid #e0e0e0',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1.5,
          minWidth: 200,
        }}
      >
        {getIcon(node.type)}
        <Box>
          <Box sx={{ fontWeight: 600, fontSize: 14 }}>{node.name}</Box>
          <Box sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'capitalize' }}>
            {node.type}
          </Box>
        </Box>
      </Box>
      {node.children && (
        <Box sx={{ ml: 2, borderLeft: '2px solid #e0e0e0', pl: 2, mt: 1 }}>
          {node.children.map((child: any) => renderNode(child, level + 1))}
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>Organization Hierarchy</Box>
        <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
          Visual representation of company structure and reporting relationships
        </Box>
      </Box>

      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ fontSize: 18, fontWeight: 600, mb: 3 }}>
            Company Structure
          </Box>
          <Box sx={{ overflowX: 'auto', pb: 2 }}>
            {orgStructure.map((node) => renderNode(node))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
