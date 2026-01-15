import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import '../models/User.js';

const User = mongoose.model('users');

export default function configurarPassport() {
    passport.use(
        new LocalStrategy(
            { usernameField: 'email' },
            async (email, senha, done) => {
                try {
                    const usuario = await User.findOne({ email });

                    if (!usuario) {
                        return done(null, false, {
                            message: 'Email ou senha inválidos',
                        });
                    }

                    const senhaConfere = await bcrypt.compare(
                        senha,
                        usuario.senha
                    );

                    if (!senhaConfere) {
                        return done(null, false, {
                            message: 'Email ou senha inválidos',
                        });
                    }

                    return done(null, usuario);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
}
