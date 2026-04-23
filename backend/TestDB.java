import java.sql.Connection;
import java.sql.DriverManager;

public class TestDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:6543/postgres";
        String user = "postgres.yxizlnazphlfxzbrhdfu";
        String password = "Ani&369&8112";

        try {
            System.out.println("Testing connection pooler (6543)...");
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("Connection successful!");
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
