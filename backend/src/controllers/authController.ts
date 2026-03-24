import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, CompanyProfile } from '../models';
import { signToken, verifyToken } from '../utils/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role, companyName } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const normalizedRole = role === 'COMPANY' || role === 'ADMIN' ? role : 'CUSTOMER';

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: normalizedRole,
        });

        if (normalizedRole === 'COMPANY' && companyName) {
            await CompanyProfile.create({
                userId: user._id,
                companyName
            });
        }

        res.status(201).json({ message: 'User registered successfully', userId: user._id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        if (user.role === 'COMPANY') {
            const companyProfile = await CompanyProfile.findOne({ userId: user._id });
            if (companyProfile && companyProfile.approvalStatus === 'PENDING') {
                res.status(403).json({ error: 'Your company account is currently pending admin approval. Please wait.' });
                return;
            }
            if (companyProfile && companyProfile.approvalStatus === 'SUSPENDED') {
                res.status(403).json({ error: 'Your company account is suspended. Contact support.' });
                return;
            }
        }

        const token = signToken({ id: user._id.toString(), email: user.email, role: user.role });

        // Set cookie on response
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 * 1000, // 1 week in ms
            path: '/'
        });

        res.json({
            message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token // Also sending token in body for flexibility
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const me = async (req: Request, res: Response): Promise<void> => {
    try {
        // Allow token from cookie or Auth header
        let token = req.cookies?.token;
        if (!token && req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({ user: null });
            return;
        }

        const decoded = verifyToken(token) as { id: string, role: string } | null;
        if (!decoded) {
            res.status(401).json({ user: null });
            return;
        }

        const user = await User.findById(decoded.id).lean();
        if (!user) {
            res.status(401).json({ user: null });
            return;
        }

        let companyProfile = null;
        if (user.role === 'COMPANY') {
            companyProfile = await CompanyProfile.findOne({ userId: user._id }).lean();
        }

        const { password, ...userWithoutPassword } = user;

        // Return structured data exactly like Next.js API did
        res.json({
            user: {
                ...userWithoutPassword,
                id: user._id,
                companyProfile: companyProfile ? { ...companyProfile, id: companyProfile._id } : null
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({ user: null });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};
