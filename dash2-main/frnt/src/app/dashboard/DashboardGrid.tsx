"use client";

import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
  borderRadius: theme.shape.borderRadius,
}));

const GridContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: 'repeat(1, 1fr)',
  padding: theme.spacing(2),
  '@media (min-width: 600px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
}));

interface DashboardGridProps {
  certificateCount: number;
  serviceCount: number;
}

export default function DashboardGrid({ certificateCount, serviceCount }: DashboardGridProps) {
  return (
    <GridContainer>
      <Item>
        <h3>Total Certificates</h3>
       
      </Item>
      <Item>
        <h3>Total Services</h3>
      </Item>
      <Item>
        <h3>Upcoming Renewals</h3>
        {/* Add content here */}
      </Item>
      <Item>
        <h3>Service Status</h3>
        {/* Add content here */}
      </Item>
    </GridContainer>
  );
}
