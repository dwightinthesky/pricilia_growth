import { SignJWT, jwtVerify } from "jose";

export async function signState(secret, payload) {
    const secretKey = new TextEncoder().encode(secret);
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("10m") // State shouldn't live long
        .sign(secretKey);
}

export async function verifyState(secret, token) {
    try {
        const secretKey = new TextEncoder().encode(secret);
        const { payload } = await jwtVerify(token, secretKey);
        return payload;
    } catch (err) {
        return null;
    }
}
