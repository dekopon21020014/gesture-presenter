'use client'
import { Stack, Button, Box, TextField, Paper, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { FormValuesType } from '@/app/types/form-value.type';

export function LogInForm(props: {
    onSubmit: (formValues: FormValuesType) => void;
    isLoading: boolean;
}) {
    const { handleSubmit, formState: { errors }, register } = useForm<FormValuesType>();

    return (
        <Paper elevation={3} sx={{ maxWidth: '600px', margin: 'auto', padding: 4, marginTop: 8 }}>
            <form noValidate onSubmit={handleSubmit(props.onSubmit)}>
                <Stack spacing={2}>
                    <TextField
                        label="メールアドレス"
                        type='email'
                        variant="filled"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        {...register('email', {
                            required: 'メールアドレスを入力してください',
                            pattern: {
                                value: /\S+@\S+\.\S+/,
                                message: "無効なメールアドレスです",
                            }
                        })}
                    />

                    <TextField
                        label="パスワード"
                        type='password'
                        variant="filled"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        {...register('password', { required: 'パスワードを入力してください' })}
                    />       
                   
                    <Box textAlign='right'>
                        <Button
                            variant="contained"
                            type='submit'
                            disabled={props.isLoading}
                        >
                            送信
                        </Button>
                    </Box>
                </Stack>
            </form>
        </Paper>
    );
};