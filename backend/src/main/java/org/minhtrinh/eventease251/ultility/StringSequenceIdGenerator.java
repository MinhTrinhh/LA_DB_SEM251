package org.minhtrinh.eventease251.ultility;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;
import java.io.Serializable;
import java.sql.ResultSet;
import java.sql.Statement;

public class StringSequenceIdGenerator implements IdentifierGenerator {

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {

        // Correct Approach: Use doReturningWork to safely get the Connection
        return session.doReturningWork(connection -> {
            try (Statement statement = connection.createStatement()) {
                // Run your sequence query
                ResultSet rs = statement.executeQuery("SELECT NEXT VALUE FOR seq_participant_id");

                if (rs.next()) {
                    long id = rs.getLong(1);
                    return "P" + id; // Returns "P1", "P2", etc.
                }
            }
            return null;
        });
    }
}