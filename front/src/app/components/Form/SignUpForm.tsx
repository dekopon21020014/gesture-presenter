'use client'
import { Stack, Button, Box, TextField, Paper, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { FormValuesType } from '@/app/types/form-value.type';

export function SignUpForm(props: {
    onSubmit: (formValues: FormValuesType) => void;
    isLoading: boolean;
}) {
    const { handleSubmit, watch, formState: { errors }, register } = useForm<FormValuesType>();
    const passwordValue = watch('password', '');

    return (
        <Paper elevation={3} sx={{ maxWidth: '600px', margin: 'auto', padding: 4, marginTop: 8 }}>
            <form noValidate onSubmit={handleSubmit(props.onSubmit)}>
                <Stack spacing={2}>
                    <TextField
                        label="メールアドレス（必須）"
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
                        label="表示名"
                        variant="filled"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        {...register('name', { required: '表示名を入力してください' })}
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

                    <TextField
                        label="パスワードの確認"
                        type='password'
                        variant="filled"
                        fullWidth
                        error={!!errors.passwordConfirmation}
                        helperText={errors.passwordConfirmation?.message}
                        {...register('passwordConfirmation', {
                            required: 'パスワードの確認を入力してください',
                            validate: value =>
                                value === passwordValue || 'パスワードが一致しません'
                        })}
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