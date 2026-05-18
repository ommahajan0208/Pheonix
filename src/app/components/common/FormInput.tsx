import { TextField, TextFieldProps } from '@mui/material';

export default function FormInput(props: TextFieldProps) {
  return (
    <TextField
      {...props}
      variant={props.variant ?? 'outlined'}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'var(--phoenix-surface-muted)',
          borderRadius: '12px',
          '& fieldset': {
            borderColor: 'var(--phoenix-border)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(25,118,210,0.35)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'var(--phoenix-accent)',
            boxShadow: '0 0 0 4px rgba(25,118,210,0.12)',
          },
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: 'var(--phoenix-accent)',
        },
        ...props.sx,
      }}
    />
  );
}
