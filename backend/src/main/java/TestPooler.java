import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Arrays;
import java.util.List;

public class TestPooler {
    public static void main(String[] args) {
        String pass = "Anirudhane3698112";
        String proj = "yxizlnazphlfxzbrhdfu";
        String user = "postgres." + proj;
        String rawUser = "postgres";

        List<String> hosts = Arrays.asList(
            "aws-0-ap-south-1.pooler.supabase.com:6543",
            "aws-0-ap-south-1.pooler.supabase.com:5432",
            "db." + proj + ".supabase.co:5432",
            "db." + proj + ".supabase.co:6543",
            "pooler.supabase.com:6543",
            "pooler.supabase.com:5432"
        );

        System.out.println("Testing Connections to Supabase...");
        
        for (String host : hosts) {
            System.out.println("\nTesting: " + host + " with user=" + user);
            try {
                DriverManager.setLoginTimeout(3);
                Connection conn = DriverManager.getConnection("jdbc:postgresql://" + host + "/postgres", user, pass);
                System.out.println("SUCCESS (user=" + user + ")!");
                conn.close();
                return;
            } catch (Exception e) {
                System.out.println("FAILED (user=" + user + "): " + e.getMessage());
            }

            System.out.println("Testing: " + host + " with raw user=" + rawUser);
            try {
                DriverManager.setLoginTimeout(3);
                Connection conn = DriverManager.getConnection("jdbc:postgresql://" + host + "/postgres", rawUser, pass);
                System.out.println("SUCCESS (raw user=" + rawUser + ")!");
                conn.close();
                return;
            } catch (Exception e) {
                System.out.println("FAILED (raw user=" + rawUser + "): " + e.getMessage());
            }
        }
    }
}
