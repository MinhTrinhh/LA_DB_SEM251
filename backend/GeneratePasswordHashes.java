import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneratePasswordHashes {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("=== GENERATING BCRYPT HASHES ===\n");
        
        String participantPassword = "password123";
        String organizerPassword = "organizer123";
        
        String hash1 = encoder.encode(participantPassword);
        String hash2 = encoder.encode(organizerPassword);
        
        System.out.println("Plain-text: " + participantPassword);
        System.out.println("BCrypt Hash: " + hash1);
        System.out.println("Length: " + hash1.length());
        System.out.println("\nPlain-text: " + organizerPassword);
        System.out.println("BCrypt Hash: " + hash2);
        System.out.println("Length: " + hash2.length());
        
        System.out.println("\n=== VERIFICATION TEST ===\n");
        System.out.println("password123 matches hash1: " + encoder.matches(participantPassword, hash1));
        System.out.println("organizer123 matches hash2: " + encoder.matches(organizerPassword, hash2));
        
        // Test current hashes from database
        String currentParticipantHash = "$2a$10$N9qo8uLOickgx2ZMRZoMye1J5S5.JzXq3zJLhGxGlXxnL5K8zGJJG";
        String currentOrganizerHash = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";
        
        System.out.println("\n=== TESTING CURRENT DB HASHES ===\n");
        System.out.println("password123 matches DB hash: " + encoder.matches(participantPassword, currentParticipantHash));
        System.out.println("organizer123 matches DB hash: " + encoder.matches(organizerPassword, currentOrganizerHash));
    }
}
