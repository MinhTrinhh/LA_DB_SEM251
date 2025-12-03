import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.util.Base64;

public class KeyGenerator {
    public static void main(String[] args) {
        // 1. Generate Key (Works on older and newer versions)
        SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

        // 2. Encode to Base64
        String encodedKey = Base64.getEncoder().encodeToString(key.getEncoded());

        System.out.println(encodedKey);
    }
}