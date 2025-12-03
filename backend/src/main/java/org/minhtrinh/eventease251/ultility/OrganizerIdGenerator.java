package org.minhtrinh.eventease251.ultility;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;
import java.sql.ResultSet;
import java.sql.Statement;

public class OrganizerIdGenerator implements IdentifierGenerator {
    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        return session.doReturningWork(connection -> {
            try (Statement statement = connection.createStatement()) {
                // CHANGE 1: Use the organizer sequence
                ResultSet rs = statement.executeQuery("SELECT NEXT VALUE FOR seq_organizer_id");

                if (rs.next()) {
                    long id = rs.getLong(1);
                    // CHANGE 2: Use 'O' prefix
                    return "O" + id;
                }
            }
            return null;
        });
    }
}